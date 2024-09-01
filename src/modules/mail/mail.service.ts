import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor() {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        // Aquí debes colocar tu clave API de Brevo
        apiKey.apiKey = process.env.BREVO_API_KEY; // Asegúrate de tener esta variable en tu .env

        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            // Configura el correo electrónico
            sendSmtpEmail.subject = 'Restablecimiento de Contraseña';
            sendSmtpEmail.htmlContent = `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">Restablecer Contraseña</a>
        <p>Si no has solicitado un restablecimiento de contraseña, por favor ignora este correo.</p>
        <p>Gracias,</p>
        <p>El equipo de soporte de BeEvents</p>
      `;
            sendSmtpEmail.sender = { email: process.env.MAIL_FROM_ADDRESS, name: process.env.MAIL_FROM_NAME };
            sendSmtpEmail.to = [{ email }];

            // Envía el correo electrónico
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Email sent successfully. Data:', data);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
