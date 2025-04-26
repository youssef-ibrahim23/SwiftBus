package com.swift.SwiftBus.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.swift.SwiftBus.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
 
    User findByEmailAndPassword(String email , String password);
    @Query("SELECT u FROM User u WHERE u.email = ?1")
     User findByEmail(String email);

}
