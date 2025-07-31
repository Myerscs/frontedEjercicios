import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService, User, UpdateUserRequest } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service'; // Asume que tienes un AuthService

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const loading = await this.loadingController.create({
      message: 'Cargando perfil...',
    });
    await loading.present();

    this.userService.getUser().subscribe({
      next: (user: User) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        loading.dismiss();
      },
      error: async (error: any) => {
        loading.dismiss();
        await this.showToast('Error al cargar el perfil', 'danger');
        console.error('Error:', error);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Actualizando perfil...',
      });
      await loading.present();

      const updateData: UpdateUserRequest = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email
      };

      this.userService.updateUser(updateData).subscribe({
        next: async (updatedUser: User) => {
          this.user = updatedUser;
          this.isEditing = false;

          // 🔥 Recarga datos del servidor
          await this.loadUserProfile();

          loading.dismiss();
          await this.showToast('Perfil actualizado correctamente', 'success');
        },
        error: async (error: any) => {
          loading.dismiss();
          await this.showToast('Error al actualizar el perfil', 'danger');
          console.error('Error:', error);
        }
      });
    } else {
      await this.showToast('Completa todos los campos correctamente', 'warning');
    }
  }

  async confirmSave() {
    const alert = await this.alertController.create({
      header: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: () => this.saveProfile() }
      ]
    });
    await alert.present();
  }

  // 🔥 Método para confirmar el logout
  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cerrar Sesión',
          cssClass: 'danger',
          handler: () => this.logout()
        }
      ]
    });
    await alert.present();
  }

  // 🔥 Método para cerrar sesión
  async logout() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
    });
    await loading.present();
    
    try {
      // Llama al servicio de autenticación para cerrar sesión
      this.authService.logout(); // Tu método logout() ya maneja localStorage y navegación
      
      loading.dismiss();
      
      // Muestra mensaje de confirmación
      await this.showToast('Sesión cerrada correctamente', 'success');
      
      // No necesitas navegar aquí porque authService.logout() ya lo hace
      
    } catch (error) {
      loading.dismiss();
      await this.showToast('Error al cerrar sesión', 'danger');
      console.error('Logout error:', error);
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'athlete': 'Atleta',
      'coach': 'Entrenador', 
      'admin': 'Administrador'
    };
    return roleLabels[role] || role;
  }
}