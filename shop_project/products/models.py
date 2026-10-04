from django.db import models
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    brand = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=10)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    is_trending = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.brand})"

    @property
    def discounted_price(self):
        if self.discount > 0:
            factor = Decimal(100 - self.discount) / Decimal(100)
            return round(self.price * factor, 2)
        return self.price
