package com.university.group3.project.service;

import com.university.group3.project.dtos.MailBody;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService{


    private final JavaMailSender javaMailSender;

    @Value("${app.mail-from}")
    private String mailFrom;


    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public  void sendSimpleMessasge(MailBody mailBody){


        SimpleMailMessage message= new SimpleMailMessage();
        message.setTo(mailBody.to());
        message.setFrom(mailFrom);
        message.setSubject(mailBody.subject());
        message.setText(mailBody.text());


        javaMailSender.send(message);
    }
}

