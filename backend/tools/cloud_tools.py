"""
Cloud Service Tools for Haunted Helpdesk

Provides AWS cloud troubleshooting capabilities including S3 bucket operations.
"""

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Dict, Any
from strands.tools import tool


@tool
def list_all_buckets() -> Dict[str, Any]:
    """
    List all S3 buckets in the AWS account.
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if operation succeeded
        - buckets: List of bucket names
        - count: Number of buckets found
        - error: Error message if operation failed
    """
    try:
        s3_client = boto3.client('s3')
        response = s3_client.list_buckets()
        
        bucket_names = [bucket['Name'] for bucket in response.get('Buckets', [])]
        
        return {
            "success": True,
            "buckets": bucket_names,
            "count": len(bucket_names),
            "error": None
        }
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        
        if error_code == 'ExpiredToken':
            return {
                "success": False,
                "buckets": [],
                "count": 0,
                "error": "AWS credentials have expired. Please refresh your AWS credentials and try again."
            }
        else:
            return {
                "success": False,
                "buckets": [],
                "count": 0,
                "error": f"AWS error ({error_code}): {str(e)}"
            }
            
    except NoCredentialsError:
        return {
            "success": False,
            "buckets": [],
            "count": 0,
            "error": "AWS credentials not found. Please configure your AWS credentials."
        }
        
    except Exception as e:
        return {
            "success": False,
            "buckets": [],
            "count": 0,
            "error": f"Unexpected error listing buckets: {str(e)}"
        }


@tool
def get_bucket_location(bucket_name: str) -> Dict[str, Any]:
    """
    Get the AWS region location of an S3 bucket.
    
    Args:
        bucket_name: The name of the S3 bucket
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if operation succeeded
        - bucket: The bucket name
        - region: The AWS region where the bucket is located
        - error: Error message if operation failed
    """
    try:
        s3_client = boto3.client('s3')
        response = s3_client.get_bucket_location(Bucket=bucket_name)
        
        # AWS returns None for us-east-1, so we need to handle that
        location = response.get('LocationConstraint')
        region = location if location else 'us-east-1'
        
        return {
            "success": True,
            "bucket": bucket_name,
            "region": region,
            "error": None
        }
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        
        if error_code == 'ExpiredToken':
            return {
                "success": False,
                "bucket": bucket_name,
                "region": None,
                "error": "AWS credentials have expired. Please refresh your AWS credentials and try again."
            }
        elif error_code == 'NoSuchBucket':
            return {
                "success": False,
                "bucket": bucket_name,
                "region": None,
                "error": f"Bucket '{bucket_name}' does not exist."
            }
        elif error_code == 'AccessDenied':
            return {
                "success": False,
                "bucket": bucket_name,
                "region": None,
                "error": f"Access denied to bucket '{bucket_name}'. Check your IAM permissions."
            }
        else:
            return {
                "success": False,
                "bucket": bucket_name,
                "region": None,
                "error": f"AWS error ({error_code}): {str(e)}"
            }
            
    except NoCredentialsError:
        return {
            "success": False,
            "bucket": bucket_name,
            "region": None,
            "error": "AWS credentials not found. Please configure your AWS credentials."
        }
        
    except Exception as e:
        return {
            "success": False,
            "bucket": bucket_name,
            "region": None,
            "error": f"Unexpected error getting bucket location: {str(e)}"
        }


@tool
def check_bucket_exists(bucket_name: str) -> Dict[str, Any]:
    """
    Check if an S3 bucket exists and is accessible.
    
    Args:
        bucket_name: The name of the S3 bucket to check
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if operation completed (not if bucket exists)
        - bucket: The bucket name
        - exists: Boolean indicating if bucket exists
        - accessible: Boolean indicating if bucket is accessible
        - error: Error message if operation failed
    """
    try:
        s3_client = boto3.client('s3')
        s3_client.head_bucket(Bucket=bucket_name)
        
        # If head_bucket succeeds, bucket exists and is accessible
        return {
            "success": True,
            "bucket": bucket_name,
            "exists": True,
            "accessible": True,
            "error": None
        }
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        http_status = e.response.get('ResponseMetadata', {}).get('HTTPStatusCode', 0)
        
        if error_code == 'ExpiredToken':
            return {
                "success": False,
                "bucket": bucket_name,
                "exists": None,
                "accessible": None,
                "error": "AWS credentials have expired. Please refresh your AWS credentials and try again."
            }
        elif http_status == 404 or error_code == '404':
            # Bucket does not exist
            return {
                "success": True,
                "bucket": bucket_name,
                "exists": False,
                "accessible": False,
                "error": None
            }
        elif http_status == 403 or error_code == 'Forbidden':
            # Bucket exists but access is denied
            return {
                "success": True,
                "bucket": bucket_name,
                "exists": True,
                "accessible": False,
                "error": f"Bucket '{bucket_name}' exists but access is denied. Check your IAM permissions."
            }
        else:
            return {
                "success": False,
                "bucket": bucket_name,
                "exists": None,
                "accessible": None,
                "error": f"AWS error ({error_code}): {str(e)}"
            }
            
    except NoCredentialsError:
        return {
            "success": False,
            "bucket": bucket_name,
            "exists": None,
            "accessible": None,
            "error": "AWS credentials not found. Please configure your AWS credentials."
        }
        
    except Exception as e:
        return {
            "success": False,
            "bucket": bucket_name,
            "exists": None,
            "accessible": None,
            "error": f"Unexpected error checking bucket: {str(e)}"
        }
