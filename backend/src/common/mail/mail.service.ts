import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.163.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    console.log(`[邮件验证码] 收件人: ${to}, 验证码: ${code}`);
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: '【天天开心】验证码',
        html: `<div style="padding:20px;font-family:sans-serif">
          <h2>天天开心</h2>
          <p>您的验证码为：</p>
          <h1 style="color:#4A90D9;letter-spacing:8px;font-size:36px">${code}</h1>
          <p>验证码有效期为 10 分钟，如非本人操作请忽略。</p>
          <hr>
          <p style="color:#999;font-size:12px">Happy Every Day</p>
        </div>`,
      });
      console.log(`[邮件验证码] 发送成功`);
    } catch (err) {
      console.log(`[邮件验证码] SMTP 发送失败，验证码仍有效（控制台模式）`);
    }
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}