import {Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';
import {IOrder} from '../../shared/models/order/iorder';
import {HubConnectionState} from '@microsoft/signalr/dist/esm/HubConnection';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
   hubUrl = environment.hubUrl;
   hubConnection?: HubConnection;
   orderSignal = signal<IOrder | null>(null);

   createHubConnection() {
     this.hubConnection = new HubConnectionBuilder()
       .withUrl(this.hubUrl, { withCredentials: true })
       .withAutomaticReconnect()
       .build();

     this.hubConnection
       .start()
       .then(() => console.log('SignalR Connection Started'))
       .catch(err => console.error('Error establishing SignalR connection: ' + err));

     this.hubConnection.on("OrderCompleteNotification", (order: IOrder) => {
       console.log(`Order: ${order}`);
       this.orderSignal.set(order);
     });
   }

   stopHubConnection() {
      if (this.hubConnection?.state === HubConnectionState.Connected) {
        this.hubConnection.stop().catch(err => console.error(err));
      }
   }
}
