set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_task_aggregate_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_processing INTEGER;
  v_new_status TEXT;
  v_progress INTEGER;
BEGIN
  -- 统计当前任务的图片状态
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'processing')
  INTO v_total, v_completed, v_failed, v_processing
  FROM translation_images
  WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);

  -- 计算新状态
  IF v_total = 0 THEN
    v_new_status := 'pending';
    v_progress := 0;
  ELSE
    IF v_completed = v_total THEN
      v_new_status := 'completed';
    ELSIF v_failed = v_total THEN
      v_new_status := 'failed';
    ELSIF v_completed + v_failed = v_total THEN
      v_new_status := 'partial';
    ELSIF v_processing > 0 THEN
      v_new_status := 'processing';
    ELSE
      v_new_status := 'pending';
    END IF;
    v_progress := ROUND((v_completed::FLOAT / v_total) * 100);
  END IF;

  -- 更新任务表
  UPDATE translation_tasks
  SET
    status = v_new_status,
    completed_images = v_completed,
    failed_images = v_failed,
    progress = v_progress,
    started_at = CASE
      WHEN started_at IS NULL AND v_processing > 0 THEN NOW()
      ELSE started_at
    END,
    completed_at = CASE
      WHEN v_new_status IN ('completed', 'failed', 'partial') THEN NOW()
      ELSE completed_at
    END
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);

  RETURN COALESCE(NEW, OLD);
END;$function$
;


