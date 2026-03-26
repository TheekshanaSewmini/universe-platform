package com.university.group3.project.utils;

import com.university.group3.project.dtos.MailBody;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailUtils {


    private final JavaMailSender javaMailSender;

    public EmailUtils(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendMail(MailBody mailBody) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(mailBody.to());
        helper.setFrom("sachinthalakshan200225@gmail.com");
        helper.setSubject(mailBody.subject());
        helper.setText(mailBody.text(), true); // Set to true for HTML content

        javaMailSender.send(message);
    }


}
