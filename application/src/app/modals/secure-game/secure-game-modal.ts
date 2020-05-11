
/**Open an account modal */

import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'secure-game-modal',
    templateUrl: './secure-game-modal.html',
    styleUrls: ['./secure-game-modal.css']
})
export class SecureGameModal implements OnDestroy, AfterViewInit, OnInit {
    message:string ="";
    loading = false;
    err: string;
    success: string;
    code : string;

    constructor(public dialogRef: MatDialogRef<SecureGameModal>, @Inject(MAT_DIALOG_DATA) private data:{code: string, unlock : boolean },) {
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnInit() {
    }

    valider(){
        this.err = ""
        if(this.code.length>0){
            if(this.data.unlock){
                if(this.code.toLowerCase() == this.data.code){
                    this.dialogRef.close(true);
                }else{
                    this.err = "Mot de passe incorrect"
                }
            }else{
                this.dialogRef.close(this.code);
            }
        }else{
            this.err = "Code invalide"
        }
    }
    
}