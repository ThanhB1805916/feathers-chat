CREATE (friendA:Friend {name:'Friend A', dob: date('2012-11-27'), hobby:'Playing games.'});
CREATE (friendB:Friend {name:'Friend B', dob: date('2012-01-22'), hobby:'Playing games.'});

CREATE (friendA)-[:FRIEND_WITH]->(friendB);

MATCH (n1:NguoiDung {id: 1}), (n2:NguoiDung {id: 2})
MERGE  (n1)-[:BAN_BE]->(n2)
RETURN n1, n2;
