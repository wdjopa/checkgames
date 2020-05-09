
/**Open an account modal */

import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'choice-modal',
    templateUrl: './choice-modal.html',
    styleUrls: ['./choice-modal.css']
})
export class ChoiceModal implements OnDestroy, AfterViewInit, OnInit {
    message:string ="";
    loading = false;
    err: string;
    success: string;

    constructor(public dialogRef: MatDialogRef<ChoiceModal>, @Inject(MAT_DIALOG_DATA) private data:{message: string},) {
        this.message = data.message
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnInit() {
    }

    reponse(state:boolean){
        this.dialogRef.close(state);
    }
    
}