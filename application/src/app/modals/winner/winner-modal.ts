
/**Open an account modal */

import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'winner-modal',
    templateUrl: './winner-modal.html',
    styleUrls: ['./winner-modal.css']
})
export class WinnerModal implements OnDestroy, AfterViewInit, OnInit {
    pseudo:string ="";
    loading = false;
    err: string;
    success: string;

    constructor(public dialogRef: MatDialogRef<WinnerModal>, @Inject(MAT_DIALOG_DATA) private data:{pseudo: string},) {
        this.pseudo = data.pseudo
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