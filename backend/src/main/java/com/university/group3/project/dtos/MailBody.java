package com.university.group3.project.dtos;

import lombok.Builder;

@Builder
public record MailBody(String to,String subject, String text ) {
}