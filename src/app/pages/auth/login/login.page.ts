import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  LoadingController,
  IonAlert,
  ToastController, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { IUserLogin } from 'src/app//interface/IUsers';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, 
    IonInput,
    IonButton,
    IonLabel,
    IonItem,
    IonContent,
    IonAlert,
    CommonModule,
    FormsModule,
  ]
})
export class LoginPage {
  @ViewChild('username') nameInput!: IonInput;
  @ViewChild('email') emailInput!: IonInput;
  @ViewChild('password') passwordInput!: IonInput;
  @ViewChild('confirmPassword') confirmPasswordInput!: IonInput;

  name: string = '';
  password: string = '';
  loading: any;
  showAlert = false;
  showSuccessAlert = false;
  isLoginMode = true;
  alertMessage = '';
  alertSubHeader = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  constructor() {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.showAlert = false;
    this.showSuccessAlert = false;
  }

  async showLoading(message: string = 'Procesando...') {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
    });
    await this.loading.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      animated: true,
      cssClass: 'custom-toast'
    });

    await toast.present();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  async login() {
    const emailValue = await this.emailInput.getInputElement().then(el => el.value);
    const passwordValue = await this.passwordInput.getInputElement().then(el => el.value);

    if (!emailValue || !passwordValue) {
      this.showErrorAlert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.showErrorAlert('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    this.showLoading('Iniciando sesión...');

    const loginData = {
      email: emailValue,
      password: passwordValue
    };

    this.authService.login(loginData).pipe(
      finalize(() => this.loading.dismiss())
    ).subscribe({
      next: (response: IUserLogin) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/tabs']);
        this.presentToast('🎬 ¡Bienvenid@ a FitTracker');
        

       localStorage.setItem('token', response.token);
       localStorage.setItem('name', response.user.name);
       localStorage.setItem('userId', response.user.id.toString());
       localStorage.setItem('lastUsedAt', Date.now().toString());

      },
      error: (error: HttpErrorResponse) => {
        console.error('Error de login', error);
        let errorMessage = 'Error al iniciar sesión';

        if (error.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar al servidor';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.showErrorAlert('Error de autenticación', errorMessage);
      }
    });
  }

  async register() {
    const nameValue = await this.nameInput.getInputElement().then(el => el.value);
    const emailValue = await this.emailInput.getInputElement().then(el => el.value);
    const passwordValue = await this.passwordInput.getInputElement().then(el => el.value);
    const confirmPasswordValue = await this.confirmPasswordInput.getInputElement().then(el => el.value);

    if (!nameValue || !emailValue || !passwordValue || !confirmPasswordValue) {
      this.showErrorAlert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.showErrorAlert('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    if (!this.isValidPassword(passwordValue)) {
      this.showErrorAlert('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      this.showErrorAlert('Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales');
      return;
    }

    this.showLoading('Creando cuenta...');

    const registerData = {
      name: nameValue, // <- Aquí cambió
      email: emailValue,
      password: passwordValue
    };

    this.authService.register(registerData).pipe(
      finalize(() => this.loading.dismiss())
    ).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso', response);
        this.showSuccessAlert = true;
        this.presentToast('¡Cuenta creada exitosamente!', 'success');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error de registro', error);
        let errorMessage = 'Error al crear la cuenta';

        if (error.status === 409) {
          errorMessage = 'El usuario o email ya existe';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica la información ingresada';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar al servidor';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.showErrorAlert('Error de registro', errorMessage);
      }
    });
  }

  private showErrorAlert(subHeader: string, message: string) {
    this.alertSubHeader = subHeader;
    this.alertMessage = message;
    this.showAlert = true;
  }

  async loginWithGoogle() {
  try {
    const result = await this.authService.loginWithGoogleFirebase();
    const user = result.user;
     // Obtén el token ID de Firebase
  const idToken = await result.user.getIdToken();

  // Enviar el token al backend para guardar/validar usuario
  await this.authService.loginWithGoogleBackend(idToken);
// este token puedes enviarlo a tu backend si quieres validar

    localStorage.setItem('token', idToken);
    localStorage.setItem('name', user.displayName || '');
    localStorage.setItem('userId', user.uid);

    this.presentToast(`Bienvenido ${user.displayName}`);
    this.router.navigate(['/tabs/dashboard']);
  } catch (error) {
    console.error('Google login error', error);
    this.showErrorAlert('Error con Google', 'No se pudo iniciar sesión con Google');
  }
}

  async recoverPassword() {
  const email = await this.emailInput.getInputElement().then(el => el.value);

  if (!email || !this.isValidEmail(email)) {
    this.showErrorAlert('Correo inválido', 'Por favor introduce un correo válido');
    return;
  }

  try {
    await this.authService.recoverPassword(email);
    this.presentToast('📬 Revisa tu correo para restablecer tu contraseña', 'success');
  } catch (error) {
    console.error('Password reset error', error);
    this.showErrorAlert('Error', 'No se pudo enviar el correo de recuperación');
  }
}

}