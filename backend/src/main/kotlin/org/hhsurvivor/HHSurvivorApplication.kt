package org.hhsurvivor

import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import de.spinscale.dropwizard.jobs.JobsBundle
import io.dropwizard.Application
import io.dropwizard.setup.Bootstrap
import io.dropwizard.setup.Environment

class HHSurvivorApplication(): Application<HHSurvivorConfiguration>() {

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            HHSurvivorApplication().run(*args)
        }
    }

    override fun initialize(bootstrap: Bootstrap<HHSurvivorConfiguration>) {
        val downloadGamesJob = DownloadGamesJob()
        bootstrap.addBundle(JobsBundle(downloadGamesJob))
        bootstrap.objectMapper.registerModule(KotlinModule())
        bootstrap.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

    }

    override fun run(configuration: HHSurvivorConfiguration, environment: Environment) {
        environment.jersey().register(DataResource(environment.objectMapper))
    }

}
