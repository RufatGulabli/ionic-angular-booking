import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { CameraPickerComponent } from './pickers/camera-picker/camera-picker.component';

@NgModule({
    declarations: [LocationPickerComponent, MapModalComponent, CameraPickerComponent],
    imports: [CommonModule, IonicModule],
    exports: [LocationPickerComponent, MapModalComponent, CameraPickerComponent],
    entryComponents: [MapModalComponent]
})
export class SharedModule { }
