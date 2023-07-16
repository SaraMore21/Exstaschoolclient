import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PresenceService } from 'src/app/Service/presence.service';
@Component({
    selector: 'app-presence-per-group',
    templateUrl: './presence-per-group.component.html',
    styleUrls: ['./presence-per-group.component.css'],
    providers: [MessageService],
  })
  export class PresencePerGroupComponent implements OnInit {
    constructor(public presenceService:PresenceService){}
    ngOnInit(): void {
     
    }}