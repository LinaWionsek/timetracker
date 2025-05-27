import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  message: string = '';
  isVisible: boolean = false;
  duration: number = 2000;


  constructor(private toastService: ToastService) { }
  ngOnInit() {
    this.toastService.toast$.subscribe((toast) => {
      this.message = toast.message;
      this.isVisible = true;

      setTimeout(() => {
        this.isVisible = false;
      }, this.duration);
    });
  }
}
