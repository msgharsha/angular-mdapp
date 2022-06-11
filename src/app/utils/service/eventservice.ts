import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
     providedIn: 'root'
})
export class EventService {

	public sideNavOnConsultation = new BehaviorSubject('');
    public StatusOnActiveDocor = new BehaviorSubject('');
    public SelectedDocorName = new BehaviorSubject('');
    public reloadUserData = new BehaviorSubject('');
    public calenderAvailabilityView = new BehaviorSubject('');
    public SideNavDisableOnSubscription = new BehaviorSubject('');
    public unreadMessagesData = new BehaviorSubject('');

    constructor(){
    }
   
    setSideNavStatusOnConsultation(sideNavStatus) {
        this.sideNavOnConsultation.next(sideNavStatus);
    }
    
    setStatusOnActiveDocor(activeStatus){
        this.StatusOnActiveDocor.next(activeStatus);
    }

    setSelectedDocorName(doctorName){
        this.SelectedDocorName.next(doctorName);
    }

    loadUserData(status){
        this.reloadUserData.next(status); 
    }

    setCalenderAvailabilityView(data){
        this.calenderAvailabilityView.next(data); 
    }

    setSideNavDisableOnSubscription(status) {
        this.SideNavDisableOnSubscription.next(status);
    }

    setUnreadMessages(data) {
        this.unreadMessagesData.next(data);
    }
}