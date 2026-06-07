package com.arenahub.dto;

import java.util.List;

public class TwoFactorResponse {
    public String secret;
    public String qrCodeUrl;
    public List<String> backupCodes;
    public Boolean habilitado;

    public TwoFactorResponse(String secret, String qrCodeUrl, List<String> backupCodes, Boolean habilitado) {
        this.secret = secret;
        this.qrCodeUrl = qrCodeUrl;
        this.backupCodes = backupCodes;
        this.habilitado = habilitado;
    }
}

record EnableTwoFactorRequest(String code) {}

record VerifyTwoFactorRequest(String email, String password, String totpCode) {}

record DisableTwoFactorRequest(String password) {}
