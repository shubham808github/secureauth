package com.secureauth.config;

import org.springframework.web.filter.CommonsRequestLoggingFilter;

public class RequestLoggingConfig {
	
	
	public CommonsRequestLoggingFilter requestLoggingFilter() {
		CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
		filter.setIncludeClientInfo(true);
		filter.setIncludeQueryString(true);
		filter.setIncludePayload(true);
		filter.setMaxPayloadLength(2000);
		return filter;
		
	}

}
