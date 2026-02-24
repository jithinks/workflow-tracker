package com.workflow.tracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the Workflow Tracker API.
 *
 * <p>In local development the Vite dev server runs on port 5173; this config
 * allows the browser to send credentialed cross-origin requests from that
 * origin to every endpoint under /api/**.
 *
 * <p>For production deployments the allowed origin can be overridden by setting
 * the CORS_ALLOWED_ORIGIN environment variable (picked up via application-prod.yml).
 * If a more restrictive runtime origin is required, subclass or replace this
 * bean in a production-specific @Configuration class.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
