import { Component } from '@angular/core';

@Component({
    selector: 'app-notifications',
    templateUrl: './notification.component.html',
    styleUrls: [
        './notification.component.scss',
        '../../../assets/css/screen.scss'
    ]
})
export class NotificationComponent {
    constructor() {
    }

    onTabChange(e) {
    }

    updateNotificationCount(event) {
        console.log(event);
    }
}
