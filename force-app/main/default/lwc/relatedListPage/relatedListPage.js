import { LightningElement, track, api, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class RelatedListPage extends NavigationMixin(LightningElement) {

		state;
		currentPageReference;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
console.log("currentPageReference",currentPageReference);
				this.state = currentPageReference.state.c__state;
console.log("state",this.state);
    }

}