package org.hhsurvivor

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
        // nothin'
    }

    override fun run(configuration: HHSurvivorConfiguration, environment: Environment) {
        environment.jersey().register(DataResource());
    }

}
