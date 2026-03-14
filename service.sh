# shellcheck shell=busybox
MODDIR=${0%/*}
. "$MODDIR/utils.sh"
load_config
resetprop -w sys.boot_completed 0
ANDROID_DIR=/sdcard/Android
LOGCAT_PID_FILE=$LOG_PATH/logcat.pid
LOG_FILE=$LOG_PATH/boot.log
while [ ! -d "$ANDROID_DIR" ]; do
  if [ -f "$LOGCAT_PID_FILE" ]; then
    LOGCAT_PID=$(cat "$LOGCAT_PID_FILE")
    if ! kill -0 "$LOGCAT_PID" 2>/dev/null; then
      logger -t LogCatcher -p warn "logd restarted, restarting logcat"
      logcat -b "$BUFFERS" -f "$LOG_FILE" &
      echo $! >"$LOGCAT_PID_FILE"
    fi
  fi
  sleep 1
done
check_write "$ANDROID_DIR"
check_write "$EXPORT_PATH"
if [ "$PERSISTENT" != "true" ]; then
  if [ -f "$LOGCAT_PID_FILE" ]; then
    kill "$(cat "$LOGCAT_PID_FILE")" 2>/dev/null
    rm -f "$LOGCAT_PID_FILE"
  fi
  KMSG_PID_FILE=$LOG_PATH/kmsg.pid
  if [ -f "$KMSG_PID_FILE" ]; then
    kill "$(cat "$KMSG_PID_FILE")" 2>/dev/null
    rm -f "$KMSG_PID_FILE"
  fi
  BOOT_LOG_TIME=$(get_time "$LOG_PATH/boot.log")
  mv "$LOG_FILE" "$LOG_PATH/boot-$BOOT_LOG_TIME.log"
  mv "$LOG_PATH/kernel.log" "$LOG_PATH/kernel-$(get_time "$LOG_PATH/kernel.log").log"
  tar -czf "$EXPORT_PATH/bootlog-$BOOT_LOG_TIME.tar.gz" -C "$LOG_PATH" . && rm -rf "${LOG_PATH:?}"
elif [ -d "$LOG_PATH/old" ]; then
  for f in "$LOG_PATH"/old/boot-*.log; do
    [ -f "$f" ] || continue
    [ -z "$BOOT_LOG_TIME" ] && BOOT_LOG_TIME=$(get_time "$f") && break
  done
  [ -n "$BOOT_LOG_TIME" ] && tar -czf "$EXPORT_PATH/bootlog-$BOOT_LOG_TIME.tar.gz" -C "$LOG_PATH/old" . && rm -rf "${LOG_PATH:?}/old"
fi
# Prune old logs
if [ "$PRUNE_DAYS" -gt 0 ] 2>/dev/null; then
  find "$EXPORT_PATH" -name 'bootlog-*.tar.gz' -mtime +"$PRUNE_DAYS" -delete 2>/dev/null
fi
# shellcheck disable=SC2012
ls -t "$EXPORT_PATH"/bootlog-*.tar.gz 2>/dev/null | tail -n +$((MAX_LOGS + 1)) | xargs rm -f 2>/dev/null
