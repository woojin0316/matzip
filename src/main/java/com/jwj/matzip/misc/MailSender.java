package com.jwj.matzip.misc;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

public class MailSender {
    private final JavaMailSender mailSender;
    private final MimeMessage mimeMessage;
    private final MimeMessageHelper mimeMessageHelper;

    public MailSender(JavaMailSender mailSender) throws MessagingException{
        this(mailSender, false);
    }


    public MailSender(JavaMailSender mailSender, boolean multipart) throws MessagingException{

        this.mailSender = mailSender;
        this.mimeMessage = mailSender.createMimeMessage();
        this.mimeMessageHelper = new MimeMessageHelper(this.mimeMessage, multipart);
    }

    public MailSender setFrom(String from) throws MessagingException{
        this.mimeMessageHelper.setFrom(from);
        return this;
    }

    public MailSender setSubject(String subject) throws MessagingException{
        this.mimeMessageHelper.setSubject(subject);
        return this;
    }

    public MailSender setText(String text, boolean isHtml) throws MessagingException{
        this.mimeMessageHelper.setText(text, isHtml);
        return this;
    }

    public MailSender setTo(String to) throws MessagingException{
        this.mimeMessageHelper.setTo(to);
        return this;
    }

    public void send() {
        this.mailSender.send(this.mimeMessage);
    }
}
