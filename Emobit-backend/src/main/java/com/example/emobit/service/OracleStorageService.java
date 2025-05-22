package com.example.emobit.service;

import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimplePrivateKeySupplier;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.model.CreatePreauthenticatedRequestDetails;
import com.oracle.bmc.objectstorage.requests.CreatePreauthenticatedRequestRequest;
import com.oracle.bmc.objectstorage.requests.DeleteObjectRequest;
import com.oracle.bmc.objectstorage.requests.GetNamespaceRequest;
import com.oracle.bmc.objectstorage.responses.CreatePreauthenticatedRequestResponse;

@Service
public class OracleStorageService {
	private final ObjectStorageClient objectStorageClient;

    private String bucketName = "EmobitBucket";

    @SuppressWarnings("deprecation")
	public OracleStorageService() throws IOException {
    	// 인증 파일 경로 설정
        String configFilePath = System.getProperty("user.home") + "/.oci/config";
        
        String privateKeyPath = System.getProperty("user.home") + "/.oci/private_key.pem";
        new SimplePrivateKeySupplier(privateKeyPath);

        // 인증 정보 제공자 생성 (config 파일 경로 사용)
        ConfigFileAuthenticationDetailsProvider provider = 
            new ConfigFileAuthenticationDetailsProvider(configFilePath, "DEFAULT");

        // ObjectStorage 클라이언트 생성
        this.objectStorageClient = new ObjectStorageClient(provider);
    }

    // presigned URL 생성
    public String createPresignedUrl(String originalFilename, String dir) {
    	try {
            // namespaceName을 가져옴
            String namespaceName = objectStorageClient.getNamespace(GetNamespaceRequest.builder().build()).getValue();
            
            // 고유 파일명 생성
            String uuid = UUID.randomUUID().toString();
            String ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            String objectName = dir + "/" + uuid + "." + ext;

            // presigned URL 생성을 위한 요청 세부사항 설정
            CreatePreauthenticatedRequestDetails preauthenticatedRequestDetails =
                    CreatePreauthenticatedRequestDetails.builder()
                    		.name("upload-" + uuid)
                            .accessType(CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite) // ObjectWrite 작업
                            .timeExpires(Date.from(OffsetDateTime.now().plus(Duration.ofMinutes(3)).toInstant())) // 만료 시간 설정
                            .objectName(objectName)
                            .build();

            // presigned URL 생성 요청
            CreatePreauthenticatedRequestRequest request = CreatePreauthenticatedRequestRequest.builder()
                    .namespaceName(namespaceName) // namespaceName 추가
                    .bucketName(bucketName)
                    .createPreauthenticatedRequestDetails(preauthenticatedRequestDetails)
                    .build();
            
            // 요청 전송하여 presigned URL 생성
            CreatePreauthenticatedRequestResponse response = objectStorageClient.createPreauthenticatedRequest(request);
            String endpoint = "https://objectstorage.ap-chuncheon-1.oraclecloud.com";
            String accessUri = response.getPreauthenticatedRequest().getAccessUri().toString();
            String fullUrl = endpoint + accessUri;
            
            // 생성된 presigned URL 반환
            return fullUrl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public boolean deleteObject(String fileUrl) {
        try {
            // Oracle Storage의 기본 엔드포인트
            String endpoint = "https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/";
            
            // URL에서 파일명 추출
            if (!fileUrl.startsWith(endpoint)) {
                throw new IllegalArgumentException("잘못된 파일 URL입니다.");
            }

            // 네임스페이스 가져오기
            String namespaceName = objectStorageClient.getNamespace(GetNamespaceRequest.builder().build()).getValue();
            
            // 삭제하려는 파일명 추출
            String prefix = endpoint + namespaceName + "/b/" + bucketName + "/o/";
            if (!fileUrl.startsWith(prefix)) {
                throw new IllegalArgumentException("파일 URL이 네임스페이스와 버킷 이름을 포함하지 않습니다.");
            }
            String objectName = fileUrl.substring(prefix.length());
            
            // 파일 삭제 요청
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .namespaceName(namespaceName)
                    .bucketName(bucketName)
                    .objectName(objectName)
                    .build();

            objectStorageClient.deleteObject(request);
            return true; // 성공 시 true 반환
        } catch (Exception e) {
            e.printStackTrace();
            return false; // 실패 시 false 반환
        }
    }
}
