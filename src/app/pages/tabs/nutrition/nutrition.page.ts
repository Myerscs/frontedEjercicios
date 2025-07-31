import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';


interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.page.html',
  styleUrls: ['./nutrition.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ]
})
export class NutritionPage implements OnInit {
  currentDate: string = '';
  currentTip: string = '';
  
  // Objetivos nutricionales diarios
  nutritionGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  };

  // Consumo actual del día
  dailyIntake = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  // Entradas de comidas del día
  todayMeals: MealEntry[] = [];

  // Base de datos simple de alimentos
  foodDatabase: Food[] = [
    { id: '1', name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
    { id: '2', name: 'Arroz integral', calories: 123, protein: 2.6, carbs: 23, fat: 0.9, portion: '100g' },
    { id: '3', name: 'Brócoli', calories: 25, protein: 3, carbs: 5, fat: 0.3, portion: '100g' },
    { id: '4', name: 'Huevo entero', calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: '100g' },
    { id: '5', name: 'Avena', calories: 389, protein: 17, carbs: 66, fat: 7, portion: '100g' },
    { id: '6', name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: '100g' },
    { id: '7', name: 'Salmón', calories: 208, protein: 22, carbs: 0, fat: 13, portion: '100g' },
    { id: '8', name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 3.6, portion: '100g' },
    { id: '9', name: 'Almendras', calories: 576, protein: 21, carbs: 22, fat: 49, portion: '100g' },
    { id: '10', name: 'Yogur griego', calories: 100, protein: 10, carbs: 4, fat: 5, portion: '100g' }
  ];

  // Variables para agregar nueva comida
  selectedFood: Food | null = null;
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'breakfast';
  foodQuantity: number = 100;
  searchTerm: string = '';
  showAddFoodModal: boolean = false;

  constructor() {}

  ngOnInit() {
    this.updateDateTime();
    this.loadTodayMeals();
    this.calculateDailyIntake();
    this.loadNutritionGoals();
    this.setRandomTip();
  }
   private setRandomTip() {
    const tips = [
      'Mantén tu hidratación bebiendo al menos 8 vasos de agua al día',
      'Incluye proteína en cada comida para mantener la saciedad',
      'Los vegetales deben ocupar la mitad de tu plato',
      'Prefiere carbohidratos complejos como avena y quinoa',
      'Las grasas saludables como el aguacate son importantes',
      'Come despacio y disfruta cada bocado',
      'Planifica tus comidas para evitar decisiones impulsivas'
    ];

    this.currentTip = tips[Math.floor(Math.random() * tips.length)];
  }


  private updateDateTime() {
    this.currentDate = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  private loadTodayMeals() {
    const today = new Date().toDateString();
    const savedMeals = localStorage.getItem('todayMeals');
    
    if (savedMeals) {
      const meals = JSON.parse(savedMeals) as MealEntry[];
      this.todayMeals = meals.filter(meal => 
        new Date(meal.timestamp).toDateString() === today
      );
    }
  }

  private saveTodayMeals() {
    localStorage.setItem('todayMeals', JSON.stringify(this.todayMeals));
  }

  private loadNutritionGoals() {
    const savedGoals = localStorage.getItem('nutritionGoals');
    if (savedGoals) {
      this.nutritionGoals = JSON.parse(savedGoals);
    }
  }

  private calculateDailyIntake() {
    this.dailyIntake = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    this.todayMeals.forEach(meal => {
      this.dailyIntake.calories += meal.calories;
      this.dailyIntake.protein += meal.protein;
      this.dailyIntake.carbs += meal.carbs;
      this.dailyIntake.fat += meal.fat;
    });
  }

  openAddFoodModal() {
    this.showAddFoodModal = true;
    this.selectedFood = null;
    this.foodQuantity = 100;
    this.searchTerm = '';
  }

  closeAddFoodModal() {
    this.showAddFoodModal = false;
  }

  getFilteredFoods(): Food[] {
    if (!this.searchTerm) return this.foodDatabase;
    
    return this.foodDatabase.filter(food => 
      food.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectFood(food: Food) {
    this.selectedFood = food;
  }

  addFoodEntry() {
    if (!this.selectedFood || this.foodQuantity <= 0) return;

    const multiplier = this.foodQuantity / 100; // Convertir a porción basada en 100g
    
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      foodId: this.selectedFood.id,
      foodName: this.selectedFood.name,
      quantity: this.foodQuantity,
      calories: Math.round(this.selectedFood.calories * multiplier),
      protein: Math.round(this.selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(this.selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(this.selectedFood.fat * multiplier * 10) / 10,
      mealType: this.selectedMealType,
      timestamp: new Date()
    };

    this.todayMeals.push(newEntry);
    this.calculateDailyIntake();
    this.saveTodayMeals();
    this.closeAddFoodModal();
  }

  removeMealEntry(entryId: string) {
    this.todayMeals = this.todayMeals.filter(meal => meal.id !== entryId);
    this.calculateDailyIntake();
    this.saveTodayMeals();
  }

  getMealsByType(mealType: string): MealEntry[] {
    return this.todayMeals.filter(meal => meal.mealType === mealType);
  }

  getMealTypeLabel(mealType: string): string {
    const labels: { [key: string]: string } = {
      'breakfast': 'Desayuno',
      'lunch': 'Almuerzo',
      'dinner': 'Cena',
      'snack': 'Snack'
    };
    return labels[mealType] || mealType;
  }

  getCaloriesPercentage(): number {
    return Math.min(100, (this.dailyIntake.calories / this.nutritionGoals.calories) * 100);
  }

  getProteinPercentage(): number {
    return Math.min(100, (this.dailyIntake.protein / this.nutritionGoals.protein) * 100);
  }

  getCarbsPercentage(): number {
    return Math.min(100, (this.dailyIntake.carbs / this.nutritionGoals.carbs) * 100);
  }

  getFatPercentage(): number {
    return Math.min(100, (this.dailyIntake.fat / this.nutritionGoals.fat) * 100);
  }

  getRemainingCalories(): number {
    return Math.max(0, this.nutritionGoals.calories - this.dailyIntake.calories);
  }

}