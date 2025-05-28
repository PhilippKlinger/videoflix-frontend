import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-main-view',
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
    standalone: false
})
export class MainViewComponent implements OnInit {
  showRandomVideo: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      
      if (event instanceof NavigationEnd) {
        const routesToShowRandomVideo = ['/browse/video-upload', '/browse/favorites'];
        this.showRandomVideo = routesToShowRandomVideo.includes(this.router.url);
      }
    });
  }
}
