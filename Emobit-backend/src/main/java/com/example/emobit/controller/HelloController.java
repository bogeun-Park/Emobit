package com.example.emobit.controller;

import java.sql.Connection;
import java.sql.DatabaseMetaData;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {
	@GetMapping("/")
	@ResponseBody
    public String index() {
        
        return "Hello, Emobit!";
    }
	
	@Autowired
    private DataSource dataSource;
    
    @GetMapping("/db")
    @ResponseBody
    public String testDBConnection() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return "DB 연결 성공! URL: " + metaData.getURL();
        } catch (Exception e) {
            return "DB 연결 실패: " + e.getMessage();
        }
    }
}
