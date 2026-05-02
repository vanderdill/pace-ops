import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { ActivitiesService } from './api/activities.service';
import { AthletesService } from './api/athletes.service';
import { ClubsService } from './api/clubs.service';
import { GearsService } from './api/gears.service';
import { RoutesService } from './api/routes.service';
import { SegmentEffortsService } from './api/segmentEfforts.service';
import { SegmentsService } from './api/segments.service';
import { StreamsService } from './api/streams.service';
import { UploadsService } from './api/uploads.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    ActivitiesService,
    AthletesService,
    ClubsService,
    GearsService,
    RoutesService,
    SegmentEffortsService,
    SegmentsService,
    StreamsService,
    UploadsService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
