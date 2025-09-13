.PHONY: docker-build docker-export

docker-build:
	docker build -t face-rec .

docker-export:
	docker buildx build --target static -o type=local,dest=dist .
