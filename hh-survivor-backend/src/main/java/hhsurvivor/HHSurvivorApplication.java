package hhsurvivor;

import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public class HHSurvivorApplication extends Application<HHSurvivorConfiguration> {

    public static void main(final String[] args) throws Exception {
        new HHSurvivorApplication().run(args);
    }

    @Override
    public String getName() {
        return "hh-survivor";
    }

    @Override
    public void initialize(final Bootstrap<HHSurvivorConfiguration> bootstrap) {
        // TODO: application initialization
    }

    @Override
    public void run(final HHSurvivorConfiguration configuration,
                    final Environment environment) {
        // TODO: implement application
    }

}
