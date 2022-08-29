import { Settings } from './settings.dto';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    public settings: Settings | any;

    constructor() {
        this.settings = {};
    }
}