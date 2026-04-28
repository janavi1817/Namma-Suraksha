from neo4j import GraphDatabase
from typing import Dict, List, Any, Optional
import os

class GraphManager:
    """Manage Neo4j graph database for APK relationships"""
    
    def __init__(self):
        uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
        user = os.getenv('NEO4J_USER', 'neo4j')
        password = os.getenv('NEO4J_PASSWORD', 'fraudintel123')
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self._create_constraints()
    
    def _create_constraints(self):
        """Create database constraints and indexes"""
        with self.driver.session() as session:
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (a:APK) REQUIRE a.id IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Certificate) REQUIRE c.fingerprint IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (d:Domain) REQUIRE d.name IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (i:IP) REQUIRE i.address IS UNIQUE")
            session.run("CREATE INDEX IF NOT EXISTS FOR (a:APK) ON (a.package_name)")
    
    def store_apk(self, analysis: Dict[str, Any]):
        """Store APK and its relationships in graph"""
        with self.driver.session() as session:
            # Create APK node
            session.run("""
                MERGE (a:APK {id: $id})
                SET a.file_hash = $file_hash,
                    a.package_name = $package_name,
                    a.version_name = $version_name,
                    a.size = $size,
                    a.analyzed_at = datetime()
            """, 
                id=analysis['id'],
                file_hash=analysis['file_hash'],
                package_name=analysis['metadata']['package_name'],
                version_name=analysis['metadata']['version_name'],
                size=analysis['size']
            )
            
            # Create certificate node and relationship
            cert = analysis['certificate']
            session.run("""
                MERGE (c:Certificate {fingerprint: $fingerprint})
                SET c.subject = $subject,
                    c.issuer = $issuer,
                    c.serial_number = $serial_number
                WITH c
                MATCH (a:APK {id: $apk_id})
                MERGE (a)-[:SIGNED_BY]->(c)
            """,
                fingerprint=cert['fingerprint'],
                subject=cert['subject'],
                issuer=cert['issuer'],
                serial_number=cert['serial_number'],
                apk_id=analysis['id']
            )
            
            # Create domain nodes and relationships
            for domain in analysis['artifacts']['domains']:
                session.run("""
                    MERGE (d:Domain {name: $domain})
                    WITH d
                    MATCH (a:APK {id: $apk_id})
                    MERGE (a)-[:CONNECTS_TO]->(d)
                """, domain=domain, apk_id=analysis['id'])
            
            # Create IP nodes and relationships
            for ip in analysis['artifacts']['ip_addresses']:
                session.run("""
                    MERGE (i:IP {address: $ip})
                    WITH i
                    MATCH (a:APK {id: $apk_id})
                    MERGE (a)-[:CONNECTS_TO]->(i)
                """, ip=ip, apk_id=analysis['id'])
    
    def get_apk_analysis(self, apk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve APK analysis from graph"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:APK {id: $apk_id})
                OPTIONAL MATCH (a)-[:SIGNED_BY]->(c:Certificate)
                OPTIONAL MATCH (a)-[:CONNECTS_TO]->(d:Domain)
                OPTIONAL MATCH (a)-[:CONNECTS_TO]->(i:IP)
                RETURN a, c, collect(DISTINCT d.name) as domains, collect(DISTINCT i.address) as ips
            """, apk_id=apk_id)
            
            record = result.single()
            if not record:
                return None
            
            return {
                'apk': dict(record['a']),
                'certificate': dict(record['c']) if record['c'] else None,
                'domains': record['domains'],
                'ips': record['ips']
            }
    
    def get_relationships(self, apk_id: str, depth: int = 2) -> Dict[str, Any]:
        """Get relationship graph for visualization"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH path = (a:APK {id: $apk_id})-[*1..$depth]-(related)
                RETURN path
            """, apk_id=apk_id, depth=depth)
            
            nodes = []
            edges = []
            node_ids = set()
            
            for record in result:
                path = record['path']
                for node in path.nodes:
                    node_id = node.element_id
                    if node_id not in node_ids:
                        nodes.append({
                            'id': node_id,
                            'label': list(node.labels)[0],
                            'properties': dict(node)
                        })
                        node_ids.add(node_id)
                
                for rel in path.relationships:
                    edges.append({
                        'source': rel.start_node.element_id,
                        'target': rel.end_node.element_id,
                        'type': rel.type
                    })
            
            return {'nodes': nodes, 'edges': edges}
    
    def find_root_sources(self) -> List[Dict[str, Any]]:
        """Identify root sources of fraud campaigns"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (c:Certificate)<-[:SIGNED_BY]-(a:APK)
                WITH c, count(a) as apk_count, collect(a.id) as apk_ids
                WHERE apk_count > 1
                RETURN c.fingerprint as cert_fingerprint, 
                       c.subject as subject,
                       apk_count,
                       apk_ids
                ORDER BY apk_count DESC
                LIMIT 20
            """)
            
            return [dict(record) for record in result]
    
    def find_repeat_offenders(self) -> List[Dict[str, Any]]:
        """Find certificates used in multiple fraudulent APKs"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (c:Certificate)<-[:SIGNED_BY]-(a:APK)
                WHERE a.fraud_score > 0.7
                WITH c, count(a) as fraud_count, collect(a.package_name) as packages
                WHERE fraud_count > 1
                RETURN c.fingerprint as cert_fingerprint,
                       c.subject as subject,
                       fraud_count,
                       packages
                ORDER BY fraud_count DESC
            """)
            
            return [dict(record) for record in result]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get platform statistics"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:APK)
                OPTIONAL MATCH (c:Certificate)
                OPTIONAL MATCH (d:Domain)
                OPTIONAL MATCH (i:IP)
                RETURN count(DISTINCT a) as total_apks,
                       count(DISTINCT c) as total_certs,
                       count(DISTINCT d) as total_domains,
                       count(DISTINCT i) as total_ips
            """)
            
            return dict(result.single())
    
    def close(self):
        self.driver.close()
