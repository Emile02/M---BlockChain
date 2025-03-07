// src/lib/services/feedback.ts
import axios from "axios";

export interface FeedbackData {
  category: string;
  subject: string;
  message: string;
  rating: number;
  email?: string;
  walletAddress?: string;
  timestamp?: string;
}

/**
 * Envoie un feedback utilisateur au serveur backend
 *
 * @param feedback Les données du feedback
 * @returns Promise avec le résultat de l'opération
 */
export async function submitFeedback(
  feedback: FeedbackData
): Promise<{ success: boolean; message: string }> {
  try {
    // Ajouter la date actuelle si non fournie
    const completeData = {
      ...feedback,
      timestamp: feedback.timestamp || new Date().toISOString(),
    };

    // Appel API à votre backend
    // Remplacer cette URL par votre endpoint de feedback réel
    const response = await axios.post(
      "http://localhost:8000/feedback/submit",
      completeData
    );

    return {
      success: true,
      message: "Feedback envoyé avec succès",
    };
  } catch (error: any) {
    console.error("Erreur lors de l'envoi du feedback:", error);

    // Retourner un message d'erreur approprié
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'envoi du feedback",
    };
  }
}

/**
 * Récupère les feedbacks (fonctionnalité admin)
 *
 * @returns Liste des feedbacks
 */
export async function getFeedbacks(): Promise<FeedbackData[]> {
  try {
    // Appel API au backend
    // Remplacer cette URL par votre endpoint réel
    const response = await axios.get("http://localhost:8000/feedback/all");

    return response.data.feedbacks || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des feedbacks:", error);
    return [];
  }
}

/**
 * Sauvegarde en local les feedbacks quand aucun backend n'est disponible
 * (Méthode fallback pour le développement)
 *
 * @param feedback Les données du feedback
 */
export function saveLocalFeedback(feedback: FeedbackData): void {
  try {
    // Récupérer les feedbacks existants
    const existingFeedbacks = localStorage.getItem("userFeedbacks") || "[]";
    const feedbacks = JSON.parse(existingFeedbacks) as FeedbackData[];

    // Ajouter le nouveau feedback
    feedbacks.push({
      ...feedback,
      timestamp: new Date().toISOString(),
    });

    // Sauvegarder la liste mise à jour
    localStorage.setItem("userFeedbacks", JSON.stringify(feedbacks));

    console.log("Feedback sauvegardé localement");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde locale du feedback:", error);
  }
}
