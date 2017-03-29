package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.JobTimeSchedulerEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/3/6.
 */
@Repository
public interface JobSchedulerDao {
    public List<JobTimeSchedulerEntity> getAllTimerJob();

    public void addTimerJob(JobTimeSchedulerEntity job);

    public Integer getTotalCount();

    public List<JobTimeSchedulerEntity> getTimerJobByPage(int start,int limit,Integer typeId,String slaves,String jobName);

    public void deleteScheduler(long taskId);

    public JobTimeSchedulerEntity getSchedulerBytaskId(long taskId);

    public void updateScheduler(JobTimeSchedulerEntity schedulerJob);

    public void deleteSchedulerByJobName(String jobName);

    public List<JobTimeSchedulerEntity> getTimerJobByJobName(String jobName);
}
