import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { NotificationCardComponent } from 'ui-lib';

enum NotificationTypeList {
  success = 'success',
  error = 'error',
  warning = 'warning',
  info = 'info'
}

@Injectable()
export class UiNotificationService {
  private defaultDuration: number = 3000;
  private removeFromDOMDuration: number = 1000;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  warning(title: string, description: string) {
    this.message(NotificationTypeList.warning, title, description);
  }

  success(title: string, description: string) {
    this.message(NotificationTypeList.success, title, description);
  }

  info(title: string, description: string) {
    this.message(NotificationTypeList.info, title, description);
  }

  error(title: string, description: string) {
    this.message(NotificationTypeList.error, title, description);
  }

  private message(type, title: string, description: string) {
    let componentRef;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationCardComponent);
    componentRef = componentFactory.create(this.injector);
    componentRef.instance.cardData = {
      'type': type,
      'title': title,
      'description': description,
      'duration': this.defaultDuration
    };

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    const dialogComponentRef: ComponentRef<NotificationCardComponent> = componentRef;

    componentRef.instance.visibility.subscribe(v => setTimeout(() => this.removeDialogComponentFromBody(dialogComponentRef), this.removeFromDOMDuration));
  }

  private removeDialogComponentFromBody(dialogComponentRef: ComponentRef<NotificationCardComponent>) {
    this.appRef.detachView(dialogComponentRef.hostView);
    dialogComponentRef.destroy();
  }
}
