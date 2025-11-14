FROM nginx:1.29-alpine

# Remove default configuration
RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]