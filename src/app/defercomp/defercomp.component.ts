import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-defercomp',
  imports: [],
  templateUrl: './defercomp.component.html',
  styleUrl: './defercomp.component.scss'
})
export class DefercompComponent implements OnInit {
 
     
  ngOnInit() {
    console.log('DefercompComponent ngOnInit');

  }

}
