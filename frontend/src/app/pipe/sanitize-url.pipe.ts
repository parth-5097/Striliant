import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Pipe({
  name: 'sanitizeUrl'
})
export class SanitizeUrlPipe implements PipeTransform {

  constructor (
    private sanitize: DomSanitizer
  ) {}

  transform(value: string): SafeUrl {
    return this.sanitize.bypassSecurityTrustUrl(value);
  }

}
