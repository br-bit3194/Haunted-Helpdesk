"""
DynamoDB utilities for Haunted Helpdesk ticket management.

This module provides a DynamoDBManager class for CRUD operations on the HauntedHelpdeskTickets table.
"""

import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, List, Optional
from datetime import datetime
import json


class DynamoDBManager:
    """Manager class for DynamoDB operations on HauntedHelpdeskTickets table."""
    
    def __init__(self, table_name: str = "HauntedHelpdeskTickets"):
        """
        Initialize DynamoDB manager with connection to HauntedHelpdeskTickets table.
        
        Args:
            table_name: Name of the DynamoDB table (default: HauntedHelpdeskTickets)
        """
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = table_name
        self.table = self.dynamodb.Table(table_name)
    
    def create_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new ticket in DynamoDB.
        
        Args:
            ticket_data: Dictionary containing ticket information
            
        Returns:
            The created ticket data
            
        Raises:
            ClientError: If DynamoDB operation fails
        """
        try:
            # Ensure timestamps are present
            if 'created_at' not in ticket_data:
                ticket_data['created_at'] = datetime.utcnow().isoformat()
            if 'updated_at' not in ticket_data:
                ticket_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Serialize the ticket data for DynamoDB
            serialized_data = self._serialize_for_dynamodb(ticket_data)
            
            # Put item in DynamoDB
            self.table.put_item(Item=serialized_data)
            
            return ticket_data
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise ClientError(
                {
                    'Error': {
                        'Code': error_code,
                        'Message': f"Failed to create ticket: {error_message}"
                    }
                },
                'PutItem'
            )
    
    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a ticket by its ID.
        
        Args:
            ticket_id: The unique identifier of the ticket
            
        Returns:
            Ticket data if found, None otherwise
            
        Raises:
            ClientError: If DynamoDB operation fails
        """
        try:
            response = self.table.get_item(Key={'ticket_id': ticket_id})
            
            if 'Item' in response:
                return self._deserialize_from_dynamodb(response['Item'])
            return None
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise ClientError(
                {
                    'Error': {
                        'Code': error_code,
                        'Message': f"Failed to get ticket: {error_message}"
                    }
                },
                'GetItem'
            )
    
    def list_tickets(self) -> List[Dict[str, Any]]:
        """
        List all tickets in the table.
        
        Returns:
            List of all tickets
            
        Raises:
            ClientError: If DynamoDB operation fails
        """
        try:
            response = self.table.scan()
            items = response.get('Items', [])
            
            # Handle pagination if there are more items
            while 'LastEvaluatedKey' in response:
                response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
                items.extend(response.get('Items', []))
            
            return [self._deserialize_from_dynamodb(item) for item in items]
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise ClientError(
                {
                    'Error': {
                        'Code': error_code,
                        'Message': f"Failed to list tickets: {error_message}"
                    }
                },
                'Scan'
            )
    
    def update_ticket(self, ticket_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a ticket with new data.
        
        Args:
            ticket_id: The unique identifier of the ticket
            update_data: Dictionary containing fields to update
            
        Returns:
            Updated ticket data if successful, None if ticket not found
            
        Raises:
            ClientError: If DynamoDB operation fails
        """
        try:
            # Always update the updated_at timestamp
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Build update expression and attribute values
            update_expression_parts = []
            expression_attribute_values = {}
            expression_attribute_names = {}
            
            for key, value in update_data.items():
                # Use attribute names to handle reserved keywords
                attr_name = f"#{key}"
                attr_value = f":{key}"
                
                update_expression_parts.append(f"{attr_name} = {attr_value}")
                expression_attribute_names[attr_name] = key
                expression_attribute_values[attr_value] = value
            
            update_expression = "SET " + ", ".join(update_expression_parts)
            
            response = self.table.update_item(
                Key={'ticket_id': ticket_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                ReturnValues='ALL_NEW'
            )
            
            if 'Attributes' in response:
                return self._deserialize_from_dynamodb(response['Attributes'])
            return None
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            # Handle case where ticket doesn't exist
            if error_code == 'ValidationException':
                return None
                
            error_message = e.response['Error']['Message']
            raise ClientError(
                {
                    'Error': {
                        'Code': error_code,
                        'Message': f"Failed to update ticket: {error_message}"
                    }
                },
                'UpdateItem'
            )
    
    def _serialize_for_dynamodb(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Serialize data for DynamoDB storage.
        
        Handles conversion of complex types to DynamoDB-compatible formats.
        
        Args:
            data: Dictionary to serialize
            
        Returns:
            Serialized dictionary
        """
        serialized = {}
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                # Convert complex types to JSON strings
                serialized[key] = json.dumps(value)
            else:
                serialized[key] = value
        return serialized
    
    def _deserialize_from_dynamodb(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deserialize data from DynamoDB storage.
        
        Handles conversion of JSON strings back to complex types.
        
        Args:
            data: Dictionary to deserialize
            
        Returns:
            Deserialized dictionary
        """
        deserialized = {}
        for key, value in data.items():
            if isinstance(value, str):
                # Try to parse as JSON
                try:
                    deserialized[key] = json.loads(value)
                except (json.JSONDecodeError, ValueError):
                    # Not JSON, keep as string
                    deserialized[key] = value
            else:
                deserialized[key] = value
        return deserialized


# Singleton instance for global access
db_manager = DynamoDBManager()
