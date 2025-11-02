import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesSectionComponent {
  protected readonly features = signal<Feature[]>([
    {
      icon: '✍️',
      title: 'Créez et partagez',
      description: 'Écrivez en markdown et publiez facilement vos articles. Interface intuitive avec prévisualisation en temps réel.'
    },
    {
      icon: '💬',
      title: 'Commentez et échangez',
      description: 'Participez aux discussions, posez des questions et partagez votre expertise avec la communauté.'
    },
    {
      icon: '👥',
      title: 'Rejoignez la communauté',
      description: 'Suivez vos auteurs préférés, découvrez de nouveaux contenus et développez votre réseau professionnel.'
    },
    {
      icon: '🏷️',
      title: 'Organisez avec des tags',
      description: 'Classez vos articles par thématiques et facilitez la découverte de contenus pertinents.'
    },
    {
      icon: '❤️',
      title: 'Likez et sauvegardez',
      description: 'Montrez votre appréciation et gardez une trace de vos articles favoris pour y revenir plus tard.'
    },
    {
      icon: '📊',
      title: 'Suivez vos statistiques',
      description: 'Consultez les performances de vos articles : vues, likes, commentaires et tendances.'
    }
  ]);
}
