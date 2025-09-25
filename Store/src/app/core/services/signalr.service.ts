import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { IOrder } from '../../shared/models/order/iorder';

@Injectable({
   providedIn: 'root'
})
export class SignalrService {
  hubUrl = environment.hubUrl;
  hubConnection?: HubConnection;
  orderSignal = signal<IOrder | null>(null);

  createHubConnection() {
    // Avoid creating multiple connections
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR Connected Started'))
      .catch(error => console.log('❌ Error establishing connection: ', error));

    // Register handlers before start to catch early messages
    this.hubConnection.on('OrderCompletionNotification', (order: IOrder) => {
      console.log('📩 OrderCompletionNotification', order);
      this.orderSignal.set(order);
    });
  }

  stopHubConnection() {
    if (!this.hubConnection) return;

    // Remove handlers to avoid queued callbacks on a closed connection
    this.hubConnection.off('OrderCompletionNotification');

    if (this.hubConnection.state !== HubConnectionState.Disconnected) {
      this.hubConnection.stop()
        .then(() => console.log('🛑 SignalR Connection Stopped'))
        .catch(error => console.log('❌ Error stopping connection: ', error));
    }
  }
}
