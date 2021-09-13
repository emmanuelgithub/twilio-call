import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';

declare var window: any;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    tokenUrl = 'https://quickstart-4650-dev.twil.io/access-token';
    accessToken = '';
    speakerEnabled = false;
    status = 'Initializing...';
    timer = 0;
    incoming = false;
    calling = false;
    from = '';

    constructor(
        public toastCtrl: ToastController,
        public alertController: AlertController,
        public http: HTTP,
    ) {
        this.http.get(this.tokenUrl, {}, {})
        .then((res: any) => {
            console.log(JSON.stringify(res));
            if (res.status === 200) {
                this.accessToken = res.data;
                this.init();
                this.isInit();
                this.setupHandler();
                this.status = 'Ready';
            }
        }).catch(err => {
            console.log(JSON.stringify(err));
        });
    }

    init() {
        (<any>window).Twilio.TwilioVoiceClient.initialize(this.accessToken);
    }

    isInit() {
        (<any>window).Twilio.TwilioVoiceClient.clientinitialized((res) => {
            console.log('init', JSON.stringify(res));
            this.showMessage('Ready to recieve calls');
        });
    }

    setupHandler() {
        // Accept or reject a call - only needed on Android - iOS uses CallKit
        (<any>window).Twilio.TwilioVoiceClient.callinvitereceived(async (call) => {
            // var confirmed = confirm('Accept incoming call from ' + call.from + '?');
            console.log('call', JSON.stringify(call));
            if (call) {
                this.incoming = true;
                this.from = call.from;
                this.status = 'Incoming call...';
                this.showMessage('Incoming call...');
            }

        });

        // Handle Errors
        (<any>window).Twilio.TwilioVoiceClient.error((error) => {
            this.showMessage(error.message);
            console.log('error', JSON.stringify(error));
        });

        // Handle Call Connection
        (<any>window).Twilio.TwilioVoiceClient.calldidconnect((call) => {
            this.showMessage("Successfully established call");
            console.log('connect', JSON.stringify(call));
        });

        // Handle Call Disconnect
        (<any>window).Twilio.TwilioVoiceClient.calldiddisconnect((call) => {
            this.showMessage("Call ended");
            console.log('disconnect', JSON.stringify(call));
            this.status = 'Ready';
            this.calling = false;
            this.incoming = false;
        });

        this.showMessage("Handler established");
    }

    acceptCallInvite() {
        if (this.incoming) {
            (<any>window).Twilio.TwilioVoiceClient.acceptCallInvite();
            this.status = 'Call ongoing...';
            this.calling = true;
        }
    }

    rejectCallInvite() {
        (<any>window).Twilio.TwilioVoiceClient.rejectCallInvite();
        this.status = 'Ready';
        this.showMessage('Reject call');
        this.calling = false;
        this.incoming = false;
    }

    dial() {
        var params = { "to": '+6282242382604' };
        (<any>window).Twilio.TwilioVoiceClient.call(this.accessToken, params);
    }

    disconnect() {
        (<any>window).Twilio.TwilioVoiceClient.disconnect();
        this.status = 'Ready';
        this.calling = false;
        this.incoming = false;
    }

    speaker() {
        this.speakerEnabled = !this.speakerEnabled;
        if (this.speakerEnabled) {
            (<any>window).Twilio.TwilioVoiceClient.setSpeaker('on');
        } else {
            (<any>window).Twilio.TwilioVoiceClient.setSpeaker('off');
        }
    }

    mute() {
        (<any>window).Twilio.TwilioVoiceClient.muteCall();
    }

    unmute() {
        (<any>window).Twilio.TwilioVoiceClient.unmuteCall();
    }

    async showMessage(message) {
        const toast = await this.toastCtrl.create({
            //   header: message,
            message,
            position: 'bottom',
            duration: 3000
        });

        toast.present();

    }
}
