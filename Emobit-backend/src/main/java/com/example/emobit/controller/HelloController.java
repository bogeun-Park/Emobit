package com.example.emobit.controller;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {
	@GetMapping("/hello")
	public Map<String, String> hello() {
        Map<String, String> response = new HashMap<String, String>();
        response.put("message", "react, spring 연동");
        return response;
    }
	
	@Autowired
    private DataSource dataSource;
    
    @GetMapping("/db")
    public String testDBConnection() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return "DB 연결 성공! URL: " + metaData.getURL();
        } catch (Exception e) {
            return "DB 연결 실패: " + e.getMessage();
        }
    }
}
