package org.hhsurvivor

import com.codahale.metrics.MetricRegistry
import de.spinscale.dropwizard.jobs.Job
import de.spinscale.dropwizard.jobs.annotations.Every
import org.apache.commons.io.FileUtils
import org.quartz.JobExecutionContext
import org.slf4j.LoggerFactory
import java.io.File
import java.net.URL


@Every("1h")
class DownloadGamesJob() : Job() {
    val log = LoggerFactory.getLogger(DownloadGamesJob::class.java)

    override fun doJob(context: JobExecutionContext?) {
        try {
            for (i in 1..17) {
                log.info("Downloading NFL week $i data")
                val url = URL("http://www.nfl.com/ajax/scorestrip?season=2018&seasonType=REG&week=$i")
                val outFile = File("data/week_$i.xml")
                FileUtils.copyURLToFile(url, outFile, 2000, 2000)
            }
            Data.updateRecords();
        } catch (e: Exception) {
            log.error("Failed to download schedule", e);
        }
    }

}