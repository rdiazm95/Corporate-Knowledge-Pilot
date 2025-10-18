import { useState, type FormEvent } from 'react';
import ChatLayout from './components/ChatLayout';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
}

// Mensaje inicial mejorado
const initialMessage: Message = {
  id: 0,
  content: "Hola, soy Knowledge Pilot, el asistente virtual de ACME Corp. ¿En qué puedo ayudarte hoy?",
  sender: 'bot',
};

function App() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [showFollowUpOptions, setShowFollowUpOptions] = useState(false);
  
  // Guardamos el último problema reportado por el usuario
  const [lastProblemDescription, setLastProblemDescription] = useState<string>('');

  const sendMessage = async (messageToSend: string, isInternalAction = false) => {
    // Ocultamos todos los botones al enviar un mensaje
    setShowFeedbackButtons(false);
    setShowFollowUpOptions(false);

    if (!isInternalAction) {
      const userMessage: Message = { id: Date.now(), sender: 'user', content: messageToSend };
      setMessages((prev) => [...prev, userMessage]);
      // Si es un reporte de problema, guardamos la descripción
      setLastProblemDescription(messageToSend); 
    }
    
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch(`/api/ask?question=${encodeURIComponent(messageToSend)}`);
      if (!response.ok) throw new Error('Error en la respuesta de la red');

      const data = await response.json();
      const botMessage: Message = { id: Date.now() + 1, sender: 'bot', content: data.answer };
      setMessages((prev) => [...prev, botMessage]);

      if (data.follow_up_required) {
        setShowFeedbackButtons(true);
      }
    } catch (error) {
      console.error("Error al contactar la API:", error);
      const errorMessage: Message = { id: Date.now() + 1, sender: 'bot', content: "Error: No se pudo obtener respuesta del servidor." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleFeedback = (response: 'yes' | 'no') => {
    setShowFeedbackButtons(false);
    if (response === 'yes') {
      const confirmationMessage: Message = { id: Date.now(), sender: 'bot', content: "¡Genial! Me alegro de haberte ayudado. Si necesitas algo más, no dudes en preguntar." };
      setMessages((prev) => [...prev, confirmationMessage]);
    } else {
      // El problema no se solucionó, ofrecemos las siguientes opciones.
      const followUpMessage: Message = { id: Date.now(), sender: 'bot', content: "Entendido. ¿Cómo quieres proceder?" };
      setMessages((prev) => [...prev, followUpMessage]);
      setShowFollowUpOptions(true);
    }
  };

  const handleFollowUpChoice = (choice: 'create_ticket' | 'explain_more') => {
    setShowFollowUpOptions(false);
    if (choice === 'create_ticket') {
      // Usamos el problema original que guardamos para crear el ticket
      const ticketActionMessage = `ACTION_CREATE_TICKET:${lastProblemDescription}`;
      sendMessage(ticketActionMessage, true); // true indica que es una acción interna y no debe mostrarse como mensaje de usuario
    } else {
      const explainMoreMessage: Message = { id: Date.now(), sender: 'bot', content: "Por favor, describe tu problema con más detalle en el chat." };
      setMessages((prev) => [...prev, explainMoreMessage]);
    }
  };

  return (
    <ChatLayout
      messages={messages}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      showFeedbackButtons={showFeedbackButtons}
      onFeedback={handleFeedback}
      showFollowUpOptions={showFollowUpOptions}
      onFollowUpChoice={handleFollowUpChoice}
    />
  );
}

export default App;