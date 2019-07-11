import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild, Input } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-camera-picker',
  templateUrl: './camera-picker.component.html',
  styleUrls: ['./camera-picker.component.scss'],
})
export class CameraPickerComponent implements OnInit {

  @ViewChild('file') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imgPicked = new EventEmitter<string | File>();
  @Input() previousValue = false;
  selectedImage: string;
  useFilePicker = false;

  constructor(private platform: Platform) { }

  ngOnInit() {
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) || this.platform.is('desktop')) {
      this.useFilePicker = true;
    }
  }

  onPickImg() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.Base64
    }).then(image => {
      this.selectedImage = image.base64String;
      this.imgPicked.emit(this.selectedImage);
    }).catch(error => {
      if (this.useFilePicker) {
        this.filePickerRef.nativeElement.click();
      }
      console.log(error);
    });
  }

  onFileChange(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(pickedFile);
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imgPicked.emit(pickedFile);
    };
  }

}
