import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss']
})
export class ForgotPasswordPage implements OnInit {
  oobCode: string | null = null;
  email: string | null = null;
  newPassword = '';
  confirmPassword = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (this.oobCode) {
      const auth = getAuth();
      verifyPasswordResetCode(auth, this.oobCode)
        .then(email => this.email = email)
        .catch(() => this.showToast('Enlace inválido o expirado'));
    }
  }

  async resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden');
      return;
    }

    if (!this.oobCode) {
      this.showToast('Código inválido');
      return;
    }

    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, this.oobCode, this.newPassword);
      this.showToast('Contraseña restablecida correctamente ✅');
      this.router.navigate(['/login']);
    } catch (err) {
      this.showToast('Error al restablecer la contraseña');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}
