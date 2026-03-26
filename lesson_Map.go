package main

import (
	"fmt"
	"strings"
)

// 1 tạo va in map
// 2 kiểm tra tồn tại
// 3 đếm số lần xuất hiện của key
// 4 tìm số xuất hiện nhiều nhất
// 5 đếm từ trong đoạn, câu "go java go python java go"
// 6 lọc phần tử trùng ví dụ 1 2 3 4 2 3 1 5 2 -> 1 2 3 4 5
// 7 map struct CRUD

func createMap() {
	fruitMap := make(map[string]int)

	fruitMap["apple"] = 10
	fruitMap["banana"] = 5

	fmt.Println(fruitMap)

	_, ok := fruitMap["apple"]
	if ok == true {
		fmt.Println("Found")
	} else {
		fmt.Println("Not Found")
	}

	nums := []int{1, 2, 2, 3, 1, 4, 6, 2, 3, 1, 4, 5, 6, 7, 7, 2, 3, 1, 2, 4, 3, 1}
	count := make(map[int]int)
	for _, v := range nums {
		count[v]++
	}

	fmt.Println(count)

	max_value := 0
	result := []int{}

	for k, v := range count {
		if v > max_value {
			max_value = v
			result = []int{k}
		} else if v == max_value {
			result = append(result, k)
		}
	}
	fmt.Println(result)

	s := "go java go python go"
	words := strings.Fields(s)
	fmt.Println(words)
	wordCount := make(map[string]int)
	for _, v := range words {
		wordCount[v]++
	}
	fmt.Println(wordCount)

	uniqueList := []int{1, 2, 2, 3, 1, 4}
	numberCount := make(map[int]bool)
	list := []int{}
	for _, v := range uniqueList {
		if !numberCount[v] {
			numberCount[v] = true
			list = append(list, v)
		}
	}
	fmt.Println(list)
}

type User struct{
	ID int
	Name string
}

var users = make(map[int]User)

func addUser(id int, name string){
	users[id]=User{
		ID : id,
		Name: name,
	}
}
func findUser(id int) (User,bool) {
	u,ok := users[id]
	return u,ok
}

func updateUser(id int, newName string)bool{
	u,ok :=users[id]
	if !ok {
		return false
	}
	u.Name =newName
	users[id]= u 
	return true
}
func deleteUser(id int) {
	delete(users, id)
}



func printUsers(users map[int]User) {
    for k := range users{
		fmt.Println(users[k])
	}
}
